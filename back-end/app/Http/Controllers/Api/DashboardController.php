<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ActivityLog;
use App\Models\AgendaEvento;
use App\Models\Cliente;
use App\Models\Contrato;
use App\Models\Parcela;
use App\Models\Processo;
use App\Models\ProcessoPrazo;
use App\Models\Role;
use App\Models\Tarefa;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function legalMetrics(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasPermission('dashboard-juridico.view'), 403);
        $escritorioId = $request->user()->escritorio_id;
        $today = now()->toDateString();
        $upcoming = now()->addDays(7)->toDateString();

        return response()->json(['success' => true, 'data' => [
            'clientesAtivos' => Cliente::where('escritorio_id', $escritorioId)->where('status', 'ativo')->count(),
            'processosPorStatus' => Processo::where('processos.escritorio_id', $escritorioId)->join('status_processos', 'processos.status_id', '=', 'status_processos.id')->selectRaw('status_processos.nome as status, count(*) as total')->groupBy('status_processos.nome')->pluck('total', 'status'),
            'prazos' => [
                'hoje' => ProcessoPrazo::where('escritorio_id', $escritorioId)->where('status', 'pendente')->whereDate('data_vencimento', $today)->count(),
                'proximos' => ProcessoPrazo::where('escritorio_id', $escritorioId)->where('status', 'pendente')->whereBetween('data_vencimento', [$today, $upcoming])->count(),
                'vencidos' => ProcessoPrazo::where('escritorio_id', $escritorioId)->whereNotIn('status', ['concluido', 'cancelado'])->whereDate('data_vencimento', '<', $today)->count(),
            ],
            'tarefasPendentes' => Tarefa::where('escritorio_id', $escritorioId)->whereNotIn('status', ['concluida', 'cancelada'])->count(),
            'agendaProxima' => AgendaEvento::where('escritorio_id', $escritorioId)->where('status', 'agendado')->whereBetween('data_inicio', [now(), now()->addDays(7)])->orderBy('data_inicio')->limit(5)->get(['id', 'titulo', 'tipo', 'data_inicio']),
            'valores' => [
                'a_receber' => $this->outstandingValue(Parcela::where('escritorio_id', $escritorioId)->whereIn('status', ['pendente', 'parcialmente_paga'])),
                'em_atraso' => $this->outstandingValue(Parcela::where('escritorio_id', $escritorioId)->whereIn('status', ['pendente', 'parcialmente_paga'])->whereDate('data_vencimento', '<', $today)),
            ],
        ]]);
    }

    private function outstandingValue($query): float
    {
        return (float) $query->withSum('pagamentos', 'valor')->get()->sum(fn (Parcela $parcela) => max(0, (float) $parcela->valor - (float) $parcela->pagamentos_sum_valor));
    }

    public function metrics(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasPermission('infos-user.view'), 403);
        $totalUsers = User::query()->count();
        $activeUsers = User::query()->where('status', 'active')->count();
        $inactiveUsers = User::query()->where('status', 'inactive')->count();
        $totalRoles = Role::query()->count();

        $recentUsers = User::query()
            ->with(['roles.permissions'])
            ->latest()
            ->limit(5)
            ->get();

        $recentActivities = ActivityLog::query()
            ->with('user:id,name,email')
            ->latest()
            ->limit(8)
            ->get();

        $registrationsOverTime = collect(range(6, 0))->map(function (int $daysAgo) {
            $date = now()->subDays($daysAgo)->startOfDay();
            $next = $date->copy()->endOfDay();

            return [
                'date' => $date->format('d/m'),
                'users' => User::query()->whereBetween('created_at', [$date, $next])->count(),
                'active' => User::query()
                    ->whereBetween('created_at', [$date, $next])
                    ->where('status', 'active')
                    ->count(),
            ];
        })->values();

        $activityByModule = ActivityLog::query()
            ->selectRaw('module, COUNT(*) as count')
            ->groupBy('module')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'module' => (string) $row->module,
                'count' => (int) $row->count,
            ])
            ->values();

        $roleColors = [
            'admin' => '#4f46e5',
            'manager' => '#0ea5e9',
            'operator' => '#10b981',
            'auditor' => '#f59e0b',
        ];

        $usersByRole = Role::query()
            ->withCount('users')
            ->get()
            ->map(function (Role $role) use ($roleColors) {
                return [
                    'role' => $role->label,
                    'count' => (int) $role->users_count,
                    'color' => $roleColors[$role->name] ?? '#64748b',
                ];
            })
            ->values();

        $usersGrowthPercentage = $totalUsers > 0
            ? (int) round(($recentUsers->count() / max($totalUsers, 1)) * 100)
            : 0;

        $activePercentage = $totalUsers > 0
            ? (int) round(($activeUsers / $totalUsers) * 100)
            : 0;

        $escritorioId = $request->user()->escritorio_id;
        $legalMetrics = [
            'totalProcessos' => Processo::where('escritorio_id', $escritorioId)->count(),
            'processosAtivos' => Processo::where('escritorio_id', $escritorioId)->whereNull('data_encerramento')->count(),
            'totalContratos' => Contrato::where('escritorio_id', $escritorioId)->count(),
            'recebido' => (float) Parcela::where('escritorio_id', $escritorioId)->withSum('pagamentos', 'valor')->get()->sum('pagamentos_sum_valor'),
            'tarefasPendentes' => Tarefa::where('escritorio_id', $escritorioId)->whereNotIn('status', ['concluida', 'cancelada'])->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'totalUsers' => $totalUsers,
                'activeUsers' => $activeUsers,
                'inactiveUsers' => $inactiveUsers,
                'totalRoles' => $totalRoles,
                'recentLoginsCount' => ActivityLog::query()->where('action', 'login')->count(),
                'usersGrowthPercentage' => $usersGrowthPercentage,
                'activePercentage' => $activePercentage,
                'legalMetrics' => $legalMetrics,
                'registrationsOverTime' => $registrationsOverTime,
                'usersByRole' => $usersByRole,
                'activityByModule' => $activityByModule,
                'recentUsers' => UserResource::collection($recentUsers)->resolve(),
                'recentActivities' => $recentActivities->map(function (ActivityLog $log) {
                    return [
                        'id' => (string) $log->id,
                        'userId' => $log->user_id ? (string) $log->user_id : '',
                        'userName' => $log->user?->name ?? 'Sistema',
                        'userEmail' => $log->user?->email ?? 'system@local',
                        'action' => (string) $log->action,
                        'module' => (string) $log->module,
                        'description' => (string) $log->description,
                        'ipAddress' => (string) ($log->ip_address ?? '-'),
                        'userAgent' => (string) ($log->user_agent ?? '-'),
                        'details' => $log->details,
                        'createdAt' => $log->created_at?->toISOString(),
                    ];
                })->values(),
            ],
        ]);
    }
}
