<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class RbacDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Cadastrar Permissões
        $permissions = [
            // Dashboard
            ['name' => 'dashboard.view', 'label' => 'Visualizar Dashboard', 'module' => 'dashboard'],
            // Usuários
            ['name' => 'users.view', 'label' => 'Visualizar Usuários', 'module' => 'users'],
            ['name' => 'users.create', 'label' => 'Criar Usuários', 'module' => 'users'],
            ['name' => 'users.edit', 'label' => 'Editar Usuários', 'module' => 'users'],
            ['name' => 'users.delete', 'label' => 'Excluir Usuários', 'module' => 'users'],
            ['name' => 'users.status', 'label' => 'Alterar Status de Usuários', 'module' => 'users'],
            // Perfis
            ['name' => 'roles.view', 'label' => 'Visualizar Perfis', 'module' => 'roles'],
            ['name' => 'roles.create', 'label' => 'Criar Perfis', 'module' => 'roles'],
            ['name' => 'roles.edit', 'label' => 'Editar Perfis', 'module' => 'roles'],
            ['name' => 'roles.delete', 'label' => 'Excluir Perfis', 'module' => 'roles'],
            // Matriz
            ['name' => 'permissions.view', 'label' => 'Visualizar Permissões', 'module' => 'permissions'],
            // Relatórios & Logs
            ['name' => 'reports.view', 'label' => 'Visualizar Relatórios', 'module' => 'reports'],
            ['name' => 'logs.view', 'label' => 'Visualizar Logs de Auditoria', 'module' => 'logs'],
            // Configurações
            ['name' => 'settings.view', 'label' => 'Visualizar Configurações', 'module' => 'settings'],
            ['name' => 'settings.edit', 'label' => 'Editar Configurações', 'module' => 'settings'],
            // Ferramentas e documentação
            ['name' => 'api.view', 'label' => 'Visualizar API Tester', 'module' => 'api'],
            ['name' => 'design-system.view', 'label' => 'Visualizar Design System', 'module' => 'design-system'],
            ['name' => 'documentation.view', 'label' => 'Visualizar Documentação', 'module' => 'documentation'],
            ['name' => 'birthdays.view', 'label' => 'Visualizar Aniversariantes', 'module' => 'birthdays'],
            ['name' => 'auth.switch_demo', 'label' => 'Alternar Usuário de Demonstração', 'module' => 'auth'],
        ];

        $createdPermissions = [];
        foreach ($permissions as $perm) {
            $createdPermissions[$perm['name']] = Permission::updateOrCreate(
                ['name' => $perm['name']],
                $perm
            );
        }

        // 2. Cadastrar Perfis
        $adminRole = Role::updateOrCreate(
            ['name' => 'admin'],
            [
                'label' => 'Administrador',
                'description' => 'Acesso irrestrito a todas as áreas e módulos.',
                'is_system' => true,
            ]
        );
        $adminRole->permissions()->sync(Permission::pluck('id'));

        $managerRole = Role::updateOrCreate(
            ['name' => 'manager'],
            [
                'label' => 'Gerente Operacional',
                'description' => 'Gerenciamento de usuários e consulta de relatórios.',
                'is_system' => false,
            ]
        );
        $managerRole->permissions()->sync(
            Permission::whereIn('name', [
                'dashboard.view',
                'users.view',
                'users.create',
                'users.edit',
                'users.status',
                'reports.view',
                'logs.view',
            ])->pluck('id')
        );

        $operatorRole = Role::updateOrCreate(
            ['name' => 'operator'],
            [
                'label' => 'Analista',
                'description' => 'Acesso operacional a dashboards e relatórios básicos.',
                'is_system' => false,
            ]
        );
        $operatorRole->permissions()->sync(
            Permission::whereIn('name', [
                'dashboard.view',
                'users.view',
                'reports.view',
            ])->pluck('id')
        );

        // 3. Cadastrar Administrador Inicial
        $initialAdminEmail = env('INITIAL_ADMIN_EMAIL');
        $initialAdminPassword = env('INITIAL_ADMIN_PASSWORD');

        if (! $initialAdminEmail || ! $initialAdminPassword) {
            throw new RuntimeException('Defina INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD antes de executar o seeder RBAC.');
        }

        $adminUser = User::firstOrCreate(
            ['email' => $initialAdminEmail],
            [
                'name' => 'Administrador do Sistema',
                'password' => Hash::make($initialAdminPassword),
                'email_verified_at' => now(),
                'data_nascimento' => '1990-01-01',
                'status' => 'active',
            ]
        );
        $adminUser->roles()->sync([$adminRole->id]);
    }
}
