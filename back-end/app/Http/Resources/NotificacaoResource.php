<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificacaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'type' => class_basename($this->type),
            'data' => $this->sanitizeData($this->data ?? []),
            'readAt' => $this->read_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }

    private function sanitizeData(array $data): array
    {
        $sensitiveKeys = ['token', 'access_token', 'refresh_token', 'password', 'password_confirmation'];

        return collect($data)
            ->reject(fn ($value, $key) => in_array(strtolower((string) $key), $sensitiveKeys, true))
            ->map(fn ($value) => is_array($value) ? $this->sanitizeData($value) : $value)
            ->all();
    }
}
