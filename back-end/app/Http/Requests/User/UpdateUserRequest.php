<?php

namespace App\Http\Requests\User;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->route('user');

        return $user ? $this->user()->can('update', $user) : false;
    }

    public function rules(): array
    {
        $user = $this->route('user');
        $userId = is_object($user) ? $user->id : null;

        return [
            'name' => ['sometimes', 'string', 'min:3', 'max:255'],
            'email' => [
                'sometimes',
                'string',
                'email:rfc',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'data_nascimento' => ['sometimes', 'nullable', 'date'],
            'avatar' => ['nullable', 'string'],
            'password' => ['nullable', 'string', Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
            'status' => ['sometimes', 'string', 'in:active,inactive,suspended'],
            'roles' => ['sometimes', 'array', 'min:1'],
            'roles.*' => [
                'required_with:roles',
                'string',
                'exists:roles,id',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $role = Role::query()->with('permissions')->find($value);
                    if (! $role) {
                        return;
                    }

                    if (! $this->user()->hasRole('admin')
                        && ($role->name === 'admin' || array_diff($role->permissions->pluck('name')->all(), $this->user()->getAllPermissions()))) {
                        $fail('Você não pode atribuir perfis com permissões superiores às suas.');
                    }
                },
            ],
        ];
    }
}
