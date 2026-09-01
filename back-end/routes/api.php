<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BirthdayController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SettingController;
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
