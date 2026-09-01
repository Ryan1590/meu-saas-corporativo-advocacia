<?php

namespace Database\Factories;

use App\Models\Cliente;
use App\Models\Escritorio;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cliente>
 */
class ClienteFactory extends Factory
{
    protected $model = Cliente::class;

    public function definition(): array
    {
        return [
            'escritorio_id' => Escritorio::factory(),
            'tipo_pessoa' => 'PF',
            'nome' => fake()->name(),
            'cpf' => $this->validCpf(),
            'email' => fake()->safeEmail(),
            'status' => 'active',
        ];
    }

    private function validCpf(): string
    {
        $base = '';
        for ($index = 0; $index < 9; $index++) {
            $base .= (string) fake()->numberBetween(0, 9);
        }

        if (preg_match('/^(\d)\1{8}$/', $base)) {
            return $this->validCpf();
        }

        for ($position = 9; $position <= 10; $position++) {
            $sum = 0;
            for ($index = 0; $index < $position; $index++) {
                $sum += (int) $base[$index] * (($position + 1) - $index);
            }
            $digit = ($sum * 10) % 11;
            $base .= $digit === 10 ? '0' : (string) $digit;
        }

        return $base;
    }
}
