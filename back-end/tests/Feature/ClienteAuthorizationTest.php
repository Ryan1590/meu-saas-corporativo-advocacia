<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Models\Escritorio;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ClienteAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_access_cliente_from_another_escritorio(): void
    {
        $escritorio = Escritorio::factory()->create();
        $user = User::factory()->create(['escritorio_id' => $escritorio->id, 'status' => 'active']);
        $permission = Permission::create(['name' => 'clientes.view', 'label' => 'Visualizar Clientes', 'module' => 'clientes']);
        $role = Role::create(['name' => 'cliente-viewer', 'label' => 'Leitor de Clientes']);
        $role->permissions()->attach($permission);
        $user->roles()->attach($role);
        $clienteExterno = Cliente::factory()->create();

        Sanctum::actingAs($user);

        $this->getJson("/api/v1/clientes/{$clienteExterno->id}")->assertForbidden();
    }
}
