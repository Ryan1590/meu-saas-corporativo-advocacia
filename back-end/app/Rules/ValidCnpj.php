<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidCnpj implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $cnpj = preg_replace('/\D/', '', (string) $value);

        if (strlen($cnpj) !== 14 || preg_match('/^(\d)\1{13}$/', $cnpj)) {
            $fail('O CNPJ informado é inválido.');

            return;
        }

        foreach ([12, 13] as $position) {
            $sum = 0;
            $weight = $position === 12 ? 5 : 6;
            for ($index = 0; $index < $position; $index++) {
                $sum += (int) $cnpj[$index] * $weight;
                $weight = $weight === 2 ? 9 : $weight - 1;
            }
            $digit = $sum % 11 < 2 ? 0 : 11 - ($sum % 11);
            if ($digit !== (int) $cnpj[$position]) {
                $fail('O CNPJ informado é inválido.');

                return;
            }
        }
    }
}
