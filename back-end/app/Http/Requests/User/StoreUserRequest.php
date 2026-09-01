<?php

namespace App\Http\Requests\User;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', User::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'email' => ['required', 'string', 'email:rfc', 'max:255', 'unique:users,email'],
            'data_nascimento' => ['nullable', 'date'],
            'avatar' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:active,inactive,suspended'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => [
                'required',
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

    public function messages(): array
    {
        return [
            'name.required' => 'O nome do usuário é obrigatório.',
            'name.min' => 'O nome deve ter no mínimo 3 caracteres.',
            'email.required' => 'O endereço de e-mail é obrigatório.',
            'email.unique' => 'Este e-mail já está cadastrado no sistema.',
            'roles.required' => 'Selecione pelo menos um perfil para o usuário.',
            'roles.min' => 'Selecione pelo menos um perfil de acesso.',
        ];
    }
}
