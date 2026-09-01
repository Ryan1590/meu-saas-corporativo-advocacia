<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthorizationSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_without_permissions_cannot_access_administrative_endpoints(): void
    {
        $user = User::factory()->create(['status' => 'active']);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/infos-user/metrics')->assertForbidden();
        $this->getJson('/api/v1/roles')->assertForbidden();
        $this->getJson('/api/v1/permissions')->assertForbidden();
        $this->getJson('/api/v1/logs')->assertForbidden();
        $this->getJson('/api/v1/settings')->assertForbidden();
        $this->putJson('/api/v1/settings', ['settings' => []])->assertForbidden();
    }

    public function test_public_registration_and_demo_switch_are_disabled_by_default(): void
    {
        $user = User::factory()->create(['status' => 'active']);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/auth/register', [])->assertNotFound();
        $this->postJson('/api/v1/auth/switch-demo-user', ['userId' => $user->id])->assertNotFound();
    }

    public function test_role_manager_cannot_delegate_a_permission_it_does_not_hold(): void
    {
        $roleManagement = Permission::create(['name' => 'roles.create', 'label' => 'Criar perfis', 'module' => 'roles']);
        $sensitivePermission = Permission::create(['name' => 'settings.edit', 'label' => 'Editar configurações', 'module' => 'settings']);
        $managerRole = Role::create(['name' => 'role-manager', 'label' => 'Gerente']);
        $managerRole->permissions()->attach($roleManagement);
        $user = User::factory()->create(['status' => 'active']);
        $user->roles()->attach($managerRole);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/roles', [
            'name' => 'escalation-attempt',
            'label' => 'Tentativa de Escalonamento',
            'permissions' => [$sensitivePermission->name],
        ])->assertForbidden();
    }
}
