<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    private const ALLOWED_KEYS = [
        'security.require_two_factor',
        'security.password_expiration_days',
        'system.audit_retention_days',
    ];

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Setting::class);
        $defaults = [
            'security.require_two_factor' => false,
            'security.password_expiration_days' => 90,
            'system.audit_retention_days' => 180,
        ];

        $stored = Setting::query()->get();
        $settings = $defaults;

        foreach ($stored as $item) {
            $settings[$item->key] = $this->decodeValue($item->value, $item->type);
        }

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $this->authorize('update', Setting::class);

        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.security.require_two_factor' => ['sometimes', 'boolean'],
            'settings.security.password_expiration_days' => ['sometimes', 'integer', 'min:0', 'max:3650'],
            'settings.system.audit_retention_days' => ['sometimes', 'integer', 'min:30', 'max:3650'],
        ]);
        $payload = $validated['settings'];

        if (array_diff(array_keys($payload), self::ALLOWED_KEYS)) {
            abort(422, __('Uma ou mais configurações não são permitidas.'));
        }

        foreach ($payload as $key => $value) {
            Setting::query()->updateOrCreate(
                ['key' => (string) $key],
                [
                    'value' => $this->encodeValue($value),
                    'type' => gettype($value),
                ]
            );
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'updated',
            'module' => 'settings',
            'description' => 'Configurações do sistema atualizadas',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'details' => ['keys' => array_keys($payload)],
        ]);

        return response()->json([
            'success' => true,
            'message' => __('Configurações atualizadas com sucesso.'),
            'data' => $payload,
        ]);
    }

    private function encodeValue(mixed $value): string
    {
        if (is_scalar($value) || $value === null) {
            return (string) $value;
        }

        return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    private function decodeValue(?string $value, ?string $type): mixed
    {
        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => is_numeric($value) ? (int) $value : 0,
            'double' => is_numeric($value) ? (float) $value : 0.0,
            'array', 'object' => json_decode($value ?? 'null', true),
            default => $value,
        };
    }
}
