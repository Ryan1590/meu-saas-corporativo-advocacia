<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Contrato;
use App\Models\Documento;
use App\Models\Escritorio;
use App\Models\Parcela;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LegalOperationsSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_document_upload_rejects_invalid_file_type(): void
    {
        $user = $this->userWithPermissions(['documentos.create']);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/documentos', [
            'arquivo' => UploadedFile::fake()->create('arquivo.exe', 100),
            'categoria' => 'geral',
        ])->assertUnprocessable()->assertJsonValidationErrors('arquivo');
    }

    public function test_document_upload_rejects_entity_from_another_escritorio(): void
    {
        Storage::fake('private');
        $user = $this->userWithPermissions(['documentos.create']);
        $externalClient = Cliente::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/documentos', [
            'arquivo' => UploadedFile::fake()->create('contrato.pdf', 100, 'application/pdf'),
            'categoria' => 'geral',
            'cliente_id' => $externalClient->id,
        ])->assertUnprocessable()->assertJsonValidationErrors('cliente_id');
    }

    public function test_document_download_is_forbidden_for_another_escritorio(): void
    {
        $user = $this->userWithPermissions(['documentos.download']);
        $externalOffice = Escritorio::factory()->create();
        $document = Documento::create(['escritorio_id' => $externalOffice->id, 'nome' => 'sigiloso', 'nome_original' => 'sigiloso.pdf', 'tipo' => 'pdf', 'categoria' => 'geral', 'arquivo' => 'documentos/outro/sigiloso.pdf', 'mime_type' => 'application/pdf', 'tamanho' => 1]);
        Sanctum::actingAs($user);

        $this->getJson("/api/v1/documentos/{$document->id}/download")->assertForbidden();
    }

    public function test_payment_cannot_exceed_parcela_balance(): void
    {
        $user = $this->userWithPermissions(['pagamentos.create']);
        $client = Cliente::factory()->create(['escritorio_id' => $user->escritorio_id]);
        $contrato = Contrato::create(['escritorio_id' => $user->escritorio_id, 'cliente_id' => $client->id, 'numero' => 'CTR-1', 'data_inicio' => now()->toDateString(), 'valor_total' => 100, 'forma_pagamento' => 'pix']);
        $parcela = Parcela::create(['escritorio_id' => $user->escritorio_id, 'contrato_id' => $contrato->id, 'numero' => 1, 'valor' => 100, 'data_vencimento' => now()->toDateString()]);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/pagamentos', ['parcela_id' => $parcela->id, 'valor' => 101, 'data_pagamento' => now()->toDateString(), 'forma_pagamento' => 'pix'])->assertUnprocessable()->assertJsonValidationErrors('valor');
    }

    public function test_rbac_blocks_contract_listing_without_permission(): void
    {
        Sanctum::actingAs(User::factory()->create(['escritorio_id' => Escritorio::factory()->create()->id]));

        $this->getJson('/api/v1/contratos')->assertForbidden();
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
}
