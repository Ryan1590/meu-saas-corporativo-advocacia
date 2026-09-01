<?php

namespace Database\Seeders;

use App\Models\Escritorio;
use App\Models\Permission;
use App\Models\Role;
use App\Models\StatusProcesso;
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
            // Infos User
            ['name' => 'infos-user.view', 'label' => 'Visualizar Infos User', 'module' => 'infos-user'],
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
            ['name' => 'reports.export', 'label' => 'Exportar Relatórios', 'module' => 'reports'],
            ['name' => 'dashboard-juridico.view', 'label' => 'Visualizar Dashboard Jurídico', 'module' => 'dashboard-juridico'],
            ['name' => 'logs.view', 'label' => 'Visualizar Logs de Auditoria', 'module' => 'logs'],
            // Configurações
            ['name' => 'settings.view', 'label' => 'Visualizar Configurações', 'module' => 'settings'],
            ['name' => 'settings.edit', 'label' => 'Editar Configurações', 'module' => 'settings'],
            // Ferramentas e documentação
            ['name' => 'api.view', 'label' => 'Visualizar API Tester', 'module' => 'api'],
            ['name' => 'design-system.view', 'label' => 'Visualizar Design System', 'module' => 'design-system'],
            ['name' => 'documentation.view', 'label' => 'Visualizar Documentação', 'module' => 'documentation'],
            ['name' => 'birthdays.view', 'label' => 'Visualizar Aniversariantes', 'module' => 'birthdays'],
            // Clientes
            ['name' => 'clientes.view', 'label' => 'Visualizar Clientes', 'module' => 'clientes'],
            ['name' => 'clientes.create', 'label' => 'Criar Clientes', 'module' => 'clientes'],
            ['name' => 'clientes.update', 'label' => 'Editar Clientes', 'module' => 'clientes'],
            ['name' => 'clientes.delete', 'label' => 'Excluir Clientes', 'module' => 'clientes'],
            ['name' => 'clientes.restore', 'label' => 'Restaurar Clientes', 'module' => 'clientes'],
            ['name' => 'advogados.view', 'label' => 'Visualizar Advogados', 'module' => 'advogados'],
            ['name' => 'advogados.create', 'label' => 'Criar Advogados', 'module' => 'advogados'],
            ['name' => 'advogados.update', 'label' => 'Editar Advogados', 'module' => 'advogados'],
            ['name' => 'advogados.delete', 'label' => 'Excluir Advogados', 'module' => 'advogados'],
            ['name' => 'advogados.restore', 'label' => 'Restaurar Advogados', 'module' => 'advogados'],
            ['name' => 'status-processos.view', 'label' => 'Visualizar Status de Processos', 'module' => 'status-processos'],
            ['name' => 'status-processos.create', 'label' => 'Criar Status de Processos', 'module' => 'status-processos'],
            ['name' => 'status-processos.update', 'label' => 'Editar Status de Processos', 'module' => 'status-processos'],
            ['name' => 'status-processos.delete', 'label' => 'Excluir Status de Processos', 'module' => 'status-processos'],
            ['name' => 'processos.view', 'label' => 'Visualizar Processos', 'module' => 'processos'],
            ['name' => 'processos.create', 'label' => 'Criar Processos', 'module' => 'processos'],
            ['name' => 'processos.update', 'label' => 'Editar Processos', 'module' => 'processos'],
            ['name' => 'processos.delete', 'label' => 'Excluir Processos', 'module' => 'processos'],
            ['name' => 'processos.restore', 'label' => 'Restaurar Processos', 'module' => 'processos'],
            ['name' => 'processo-movimentacoes.view', 'label' => 'Visualizar Movimentações de Processos', 'module' => 'processo-movimentacoes'],
            ['name' => 'processo-movimentacoes.create', 'label' => 'Criar Movimentações de Processos', 'module' => 'processo-movimentacoes'],
            ['name' => 'processo-movimentacoes.update', 'label' => 'Editar Movimentações de Processos', 'module' => 'processo-movimentacoes'],
            ['name' => 'processo-movimentacoes.delete', 'label' => 'Excluir Movimentações de Processos', 'module' => 'processo-movimentacoes'],
            ['name' => 'processo-prazos.view', 'label' => 'Visualizar Prazos de Processos', 'module' => 'processo-prazos'],
            ['name' => 'processo-prazos.create', 'label' => 'Criar Prazos de Processos', 'module' => 'processo-prazos'],
            ['name' => 'processo-prazos.update', 'label' => 'Editar Prazos de Processos', 'module' => 'processo-prazos'],
            ['name' => 'processo-prazos.delete', 'label' => 'Excluir Prazos de Processos', 'module' => 'processo-prazos'],
            ['name' => 'processo-prazos.restore', 'label' => 'Restaurar Prazos de Processos', 'module' => 'processo-prazos'],
            ['name' => 'contratos.view', 'label' => 'Visualizar Contratos', 'module' => 'contratos'],
            ['name' => 'contratos.create', 'label' => 'Criar Contratos', 'module' => 'contratos'],
            ['name' => 'contratos.update', 'label' => 'Editar Contratos', 'module' => 'contratos'],
            ['name' => 'contratos.delete', 'label' => 'Excluir Contratos', 'module' => 'contratos'],
            ['name' => 'contratos.restore', 'label' => 'Restaurar Contratos', 'module' => 'contratos'],
            ['name' => 'parcelas.view', 'label' => 'Visualizar Parcelas', 'module' => 'parcelas'],
            ['name' => 'parcelas.create', 'label' => 'Criar Parcelas', 'module' => 'parcelas'],
            ['name' => 'parcelas.update', 'label' => 'Editar Parcelas', 'module' => 'parcelas'],
            ['name' => 'parcelas.delete', 'label' => 'Excluir Parcelas', 'module' => 'parcelas'],
            ['name' => 'parcelas.restore', 'label' => 'Restaurar Parcelas', 'module' => 'parcelas'],
            ['name' => 'pagamentos.view', 'label' => 'Visualizar Pagamentos', 'module' => 'pagamentos'],
            ['name' => 'pagamentos.create', 'label' => 'Registrar Pagamentos', 'module' => 'pagamentos'],
            ['name' => 'pagamentos.delete', 'label' => 'Excluir Pagamentos', 'module' => 'pagamentos'],
            ['name' => 'pagamentos.update', 'label' => 'Editar Pagamentos', 'module' => 'pagamentos'],
            ['name' => 'pagamentos.restore', 'label' => 'Restaurar Pagamentos', 'module' => 'pagamentos'],
            ['name' => 'documentos.view', 'label' => 'Visualizar Documentos', 'module' => 'documentos'],
            ['name' => 'documentos.create', 'label' => 'Enviar Documentos', 'module' => 'documentos'],
            ['name' => 'documentos.download', 'label' => 'Baixar Documentos', 'module' => 'documentos'],
            ['name' => 'documentos.delete', 'label' => 'Excluir Documentos', 'module' => 'documentos'],
            ['name' => 'documentos.restore', 'label' => 'Restaurar Documentos', 'module' => 'documentos'],
            ['name' => 'tarefas.view', 'label' => 'Visualizar Tarefas', 'module' => 'tarefas'],
            ['name' => 'tarefas.create', 'label' => 'Criar Tarefas', 'module' => 'tarefas'],
            ['name' => 'tarefas.update', 'label' => 'Editar Tarefas', 'module' => 'tarefas'],
            ['name' => 'tarefas.delete', 'label' => 'Excluir Tarefas', 'module' => 'tarefas'],
            ['name' => 'tarefas.restore', 'label' => 'Restaurar Tarefas', 'module' => 'tarefas'],
            ['name' => 'agenda.view', 'label' => 'Visualizar Agenda', 'module' => 'agenda'],
            ['name' => 'agenda.create', 'label' => 'Criar Eventos de Agenda', 'module' => 'agenda'],
            ['name' => 'agenda.update', 'label' => 'Editar Eventos de Agenda', 'module' => 'agenda'],
            ['name' => 'agenda.delete', 'label' => 'Excluir Eventos de Agenda', 'module' => 'agenda'],
            ['name' => 'agenda.restore', 'label' => 'Restaurar Eventos de Agenda', 'module' => 'agenda'],
            ['name' => 'notifications.view', 'label' => 'Visualizar Notificações', 'module' => 'notifications'],
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
                'infos-user.view',
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
                'description' => 'Acesso operacional às informações de usuários e relatórios básicos.',
                'is_system' => false,
            ]
        );
        $operatorRole->permissions()->sync(
            Permission::whereIn('name', [
                'infos-user.view',
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

        $escritorio = Escritorio::firstOrCreate(
            ['cnpj' => '00000000000000'],
            [
                'nome' => 'Escritório Principal',
                'razao_social' => 'Escritório Principal',
                'status' => 'active',
            ]
        );

        $adminUser = User::firstOrCreate(
            ['email' => $initialAdminEmail],
            [
                'name' => 'Administrador do Sistema',
                'escritorio_id' => $escritorio->id,
                'password' => Hash::make($initialAdminPassword),
                'email_verified_at' => now(),
                'data_nascimento' => '1990-01-01',
                'status' => 'active',
            ]
        );
        if ($adminUser->escritorio_id !== $escritorio->id) {
            $adminUser->update(['escritorio_id' => $escritorio->id]);
        }
        $adminUser->roles()->sync([$adminRole->id]);

        foreach (['Novo', 'Em análise', 'Em andamento', 'Aguardando cliente', 'Aguardando documentação', 'Aguardando audiência', 'Aguardando sentença', 'Recurso', 'Encerrado', 'Arquivado'] as $ordem => $nome) {
            StatusProcesso::updateOrCreate(
                ['escritorio_id' => $escritorio->id, 'nome' => $nome],
                ['ordem' => $ordem + 1, 'ativo' => true]
            );
        }
    }
}
