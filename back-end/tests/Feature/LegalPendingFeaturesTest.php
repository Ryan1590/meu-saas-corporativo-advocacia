<?php

namespace Tests\Feature;

use App\Models\Advogado;
use App\Models\Cliente;
use App\Models\Contrato;
use App\Models\Escritorio;
use App\Models\Pagamento;
use App\Models\Parcela;
use App\Models\Permission;
use App\Models\Processo;
use App\Models\ProcessoPrazo;
use App\Models\Role;
use App\Models\StatusProcesso;
use App\Models\User;
use App\Notifications\JuridicoNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LegalPendingFeaturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_process_vinculos_reject_cross_office_and_multiple_principals(): void
    {
        $user = $this->userWithPermissions(['processos.update']);
        $processo = $this->processo($user);
        $external = Advogado::create(['escritorio_id' => Escritorio::factory()->create()->id, 'nome' => 'Externo', 'oab_numero' => '1', 'oab_uf' => 'SP', 'status' => 'ativo']);
        Sanctum::actingAs($user);

        $this->putJson("/api/v1/processos/{$processo->id}/advogados", ['vinculos' => [['id' => $external->id, 'tipo' => 'principal']]])->assertUnprocessable();
        $first = $this->advogado($user);
        $second = $this->advogado($user);
        $this->putJson("/api/v1/processos/{$processo->id}/advogados", ['vinculos' => [['id' => $first->id, 'tipo' => 'principal'], ['id' => $second->id, 'tipo' => 'principal']]])->assertUnprocessable();
    }

    public function test_deadline_command_notifies_assigned_user(): void
    {
        Notification::fake();
        $user = $this->userWithPermissions([]);
        $processo = $this->processo($user);
        $prazo = ProcessoPrazo::create(['escritorio_id' => $user->escritorio_id, 'processo_id' => $processo->id, 'titulo' => 'Protocolar', 'data_vencimento' => now()->addDay(), 'responsavel_id' => $user->id]);

        $this->artisan('juridico:notificar-prazos')->assertSuccessful();
        Notification::assertSentTo($user, JuridicoNotification::class, fn (JuridicoNotification $notification) => true);
        $this->assertDatabaseHas('activity_logs', ['module' => 'processo-prazos', 'action' => 'notified']);
    }

    public function test_dashboard_and_report_require_permissions_and_keep_tenant_scope(): void
    {
        $user = $this->userWithPermissions(['dashboard-juridico.view', 'reports.export']);
        Cliente::factory()->create(['escritorio_id' => $user->escritorio_id, 'status' => 'ativo']);
        Cliente::factory()->create(['escritorio_id' => Escritorio::factory()->create()->id, 'status' => 'ativo']);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/dashboard-juridico/metrics')->assertOk()->assertJsonPath('data.clientesAtivos', 1);
        $this->get('/api/v1/reports/clientes/export')->assertOk();
        Sanctum::actingAs($this->userWithPermissions([]));
        $this->getJson('/api/v1/dashboard-juridico/metrics')->assertForbidden();
        $this->getJson('/api/v1/reports/clientes/export')->assertForbidden();
    }

    public function test_cancel_and_restore_payment_recalculate_parcela(): void
    {
        $user = $this->userWithPermissions(['pagamentos.delete', 'pagamentos.restore']);
        $client = Cliente::factory()->create(['escritorio_id' => $user->escritorio_id]);
        $contrato = Contrato::create(['escritorio_id' => $user->escritorio_id, 'cliente_id' => $client->id, 'numero' => 'CTR-TESTE', 'data_inicio' => now()->toDateString(), 'valor_total' => 100, 'forma_pagamento' => 'pix']);
        $parcela = Parcela::create(['escritorio_id' => $user->escritorio_id, 'contrato_id' => $contrato->id, 'numero' => 1, 'valor' => 100, 'data_vencimento' => now()->toDateString(), 'status' => 'paga']);
        $payment = Pagamento::create(['escritorio_id' => $user->escritorio_id, 'parcela_id' => $parcela->id, 'valor' => 100, 'data_pagamento' => now()->toDateString(), 'forma_pagamento' => 'pix']);
        Sanctum::actingAs($user);

        $this->postJson("/api/v1/pagamentos/{$payment->id}/cancelar")->assertOk();
        $this->assertSoftDeleted('pagamentos', ['id' => $payment->id]);
        $this->assertDatabaseHas('parcelas', ['id' => $parcela->id, 'status' => 'pendente']);
        $this->postJson("/api/v1/pagamentos/{$payment->id}/restore")->assertOk();
        $this->assertDatabaseHas('parcelas', ['id' => $parcela->id, 'status' => 'paga']);
    }

    private function userWithPermissions(array $permissions): User
    {
        $office = Escritorio::factory()->create();
        $user = User::factory()->create(['escritorio_id' => $office->id, 'status' => 'active']);
        $role = Role::create(['name' => 'role-'.uniqid(), 'label' => 'Teste']);
        foreach ($permissions as $permission) {
            $role->permissions()->attach(Permission::create(['name' => $permission, 'label' => $permission, 'module' => 'test']));
        }
        $user->roles()->attach($role);

        return $user;
    }

    private function processo(User $user): Processo
    {
        $client = Cliente::factory()->create(['escritorio_id' => $user->escritorio_id]);
        $status = StatusProcesso::create(['escritorio_id' => $user->escritorio_id, 'nome' => 'Novo', 'ordem' => 1, 'ativo' => true]);

        return Processo::create(['escritorio_id' => $user->escritorio_id, 'cliente_id' => $client->id, 'status_id' => $status->id, 'numero_processo' => 'PROC-'.uniqid(), 'titulo' => 'Teste', 'data_abertura' => now()->toDateString()]);
    }

    private function advogado(User $user): Advogado
    {
        return Advogado::create(['escritorio_id' => $user->escritorio_id, 'nome' => 'Advogado '.uniqid(), 'oab_numero' => uniqid(), 'oab_uf' => 'SP', 'status' => 'ativo']);
    }
}
