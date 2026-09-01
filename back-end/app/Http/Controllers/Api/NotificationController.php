<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificacaoResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasPermission('notifications.view'), 403);

        $items = $request->user()->notifications()->latest()->paginate(max(1, min((int) $request->query('perPage', 5), 100)));

        return response()->json(['success' => true, 'data' => NotificacaoResource::collection($items->items())->resolve(), 'meta' => ['currentPage' => $items->currentPage(), 'lastPage' => $items->lastPage(), 'perPage' => $items->perPage(), 'total' => $items->total()]]);
    }

    public function read(Request $request, string $notification): JsonResponse
    {
        abort_unless($request->user()->hasPermission('notifications.view'), 403);
        $item = $request->user()->notifications()->whereKey($notification)->firstOrFail();
        $item->markAsRead();

        return response()->json(['success' => true, 'message' => 'Notificação marcada como lida.', 'data' => (new NotificacaoResource($item->fresh()))->resolve()]);
    }

    public function readAll(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasPermission('notifications.view'), 403);
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['success' => true, 'message' => 'Notificações marcadas como lidas.', 'data' => null]);
    }
}
