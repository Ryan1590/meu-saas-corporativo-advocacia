<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'label' => $this->label,
            'description' => $this->description,
            'isSystem' => (bool) $this->is_system,
            'permissions' => $this->permissions->pluck('name')->values(),
            'permissionIds' => $this->permissions->pluck('id')->map(fn ($id) => (string) $id)->values(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
