<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Permission::class);
        $permissions = Permission::query()->orderBy('module')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => PermissionResource::collection($permissions),
        ]);
    }
}
