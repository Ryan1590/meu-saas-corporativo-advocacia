<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ActivityLog::class);
        $perPage = (int) $request->query('perPage', 10);
        $perPage = max(1, min($perPage, 100));

        $logs = ActivityLog::query()
            ->with('user:id,name,email')
            ->when($request->query('search'), function ($query, $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('description', 'like', "%{$search}%")
                        ->orWhere('action', 'like', "%{$search}%")
                        ->orWhere('module', 'like', "%{$search}%");
                });
            })
            ->when($request->query('module') && $request->query('module') !== 'all', function ($query) use ($request) {
                $query->where('module', $request->query('module'));
            })
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => collect($logs->items())->map(function (ActivityLog $log) {
                return [
                    'id' => (string) $log->id,
                    'userId' => $log->user_id ? (string) $log->user_id : null,
                    'userName' => $log->user?->name,
                    'userEmail' => $log->user?->email,
                    'action' => $log->action,
                    'module' => $log->module,
                    'description' => $log->description,
                    'ipAddress' => $log->ip_address,
                    'userAgent' => $log->user_agent,
                    'details' => $log->details,
                    'createdAt' => $log->created_at?->toISOString(),
                ];
            })->values(),
            'meta' => [
                'currentPage' => $logs->currentPage(),
                'lastPage' => $logs->lastPage(),
                'perPage' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }
}
