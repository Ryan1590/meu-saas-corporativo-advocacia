<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AdvogadoController;
use App\Http\Controllers\Api\AgendaEventoController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BirthdayController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\ContratoController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentoController;
use App\Http\Controllers\Api\EscritorioController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PagamentoController;
use App\Http\Controllers\Api\ParcelaController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ProcessoController;
use App\Http\Controllers\Api\ProcessoMovimentacaoController;
use App\Http\Controllers\Api\ProcessoPrazoController;
use App\Http\Controllers\Api\RelatorioController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\StatusProcessoController;
use App\Http\Controllers\Api\TarefaController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Rotas públicas de autenticação
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:3,1');
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
        Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');
    });

    // Rotas autenticadas protegidas por Sanctum
    Route::middleware(['auth:sanctum'])->group(function () {
        // Sessão do Usuário
        Route::get('/auth/user', [AuthController::class, 'user']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/sessions/terminate-others', [AuthController::class, 'terminateOtherSessions']);
        Route::post('/auth/switch-demo-user', [AuthController::class, 'switchDemoUser']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

        // Infos User
        Route::get('/infos-user/metrics', [DashboardController::class, 'metrics']);
        Route::get('/birthdays', [BirthdayController::class, 'index']);

        // Gestão de Usuários
        Route::apiResource('users', UserController::class);
        Route::patch('/users/{user}/status', [UserController::class, 'updateStatus']);
        Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword']);

        // Gestão Jurídica
        Route::apiResource('clientes', ClienteController::class);
        Route::post('/clientes/{cliente}/restore', [ClienteController::class, 'restore']);
        Route::get('/clientes/{cliente}/processos', [ClienteController::class, 'processos']);
        Route::get('/clientes/{cliente}/documentos', [ClienteController::class, 'documentos']);
        Route::get('/clientes/{cliente}/contratos', [ClienteController::class, 'contratos']);
        Route::get('/clientes/{cliente}/financeiro', [ClienteController::class, 'financeiro']);
        Route::apiResource('advogados', AdvogadoController::class);
        Route::post('/advogados/{advogado}/restore', [AdvogadoController::class, 'restore']);
        Route::apiResource('status-processos', StatusProcessoController::class)->parameters(['status-processos' => 'status_processo']);
        Route::apiResource('processos', ProcessoController::class);
        Route::post('/processos/{processo}/restore', [ProcessoController::class, 'restore']);
        Route::get('/processos/{processo}/advogados', [ProcessoController::class, 'advogados']);
        Route::put('/processos/{processo}/advogados', [ProcessoController::class, 'syncAdvogados']);
        Route::get('/processos/{processo}/responsaveis', [ProcessoController::class, 'responsaveis']);
        Route::put('/processos/{processo}/responsaveis', [ProcessoController::class, 'syncResponsaveis']);
        Route::get('/processos/{processo}/documentos', [ProcessoController::class, 'documentos']);
        Route::get('/processos/{processo}/contratos', [ProcessoController::class, 'contratos']);
        Route::get('/processos/{processo}/financeiro', [ProcessoController::class, 'financeiro']);
        Route::apiResource('processos.movimentacoes', ProcessoMovimentacaoController::class)->parameters(['movimentacoes' => 'movimentacao']);
        Route::apiResource('processos.prazos', ProcessoPrazoController::class);
        Route::post('/processos/{processo}/prazos/{prazo}/restore', [ProcessoPrazoController::class, 'restore']);
        Route::apiResource('contratos', ContratoController::class);
        Route::post('/contratos/{contrato}/restore', [ContratoController::class, 'restore']);
        Route::apiResource('parcelas', ParcelaController::class);
        Route::post('/parcelas/{parcela}/restore', [ParcelaController::class, 'restore']);
        Route::apiResource('pagamentos', PagamentoController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
        Route::post('/pagamentos/{pagamento}/restore', [PagamentoController::class, 'restore']);
        Route::post('/pagamentos/{pagamento}/cancelar', [PagamentoController::class, 'cancel']);
        Route::apiResource('documentos', DocumentoController::class)->only(['index', 'store', 'show', 'destroy']);
        Route::get('/documentos/{documento}/download', [DocumentoController::class, 'download']);
        Route::post('/documentos/{documento}/restore', [DocumentoController::class, 'restore']);
        Route::apiResource('tarefas', TarefaController::class);
        Route::post('/tarefas/{tarefa}/restore', [TarefaController::class, 'restore']);
        Route::apiResource('agenda-eventos', AgendaEventoController::class)->parameters(['agenda-eventos' => 'agenda_evento']);
        Route::post('/agenda-eventos/{agenda_evento}/restore', [AgendaEventoController::class, 'restore']);
        Route::get('/dashboard-juridico/metrics', [DashboardController::class, 'legalMetrics']);
        Route::get('/escritorios/{escritorio}', [EscritorioController::class, 'show']);
        Route::put('/escritorios/{escritorio}', [EscritorioController::class, 'update']);
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::patch('/notifications/{notification}/read', [NotificationController::class, 'read']);
        Route::patch('/notifications/read-all', [NotificationController::class, 'readAll']);
        Route::get('/reports/financeiro/export', [RelatorioController::class, 'financeiro']);
        Route::get('/reports/{tipo}/export', [RelatorioController::class, 'export']);

        // Perfis e Permissões
        Route::apiResource('roles', RoleController::class);
        Route::get('/permissions', [PermissionController::class, 'index']);

        // Logs de Auditoria
        Route::get('/logs', [ActivityLogController::class, 'index']);

        // Configurações
        Route::get('/settings', [SettingController::class, 'index']);
        Route::put('/settings', [SettingController::class, 'update']);
    });
});
