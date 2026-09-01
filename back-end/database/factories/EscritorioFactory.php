<?php

namespace Database\Factories;

use App\Models\Escritorio;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Escritorio>
 */
class EscritorioFactory extends Factory
{
    protected $model = Escritorio::class;

    public function definition(): array
    {
        return [
            'nome' => fake()->company(),
            'razao_social' => fake()->company(),
            'cnpj' => fake()->unique()->numerify('##############'),
            'email' => fake()->companyEmail(),
            'status' => 'active',
        ];
    }
}
