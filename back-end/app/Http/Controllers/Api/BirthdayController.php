<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BirthdayController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasPermission('birthdays.view'), 403);

        $today = Carbon::today();
        $nextMonth = $today->copy()->addMonthNoOverflow();
        $monthNames = [
            1 => 'Janeiro',
            2 => 'Fevereiro',
            3 => 'Março',
            4 => 'Abril',
            5 => 'Maio',
            6 => 'Junho',
            7 => 'Julho',
            8 => 'Agosto',
            9 => 'Setembro',
            10 => 'Outubro',
            11 => 'Novembro',
            12 => 'Dezembro',
        ];
        $users = User::query()
            ->with('roles')
            ->whereNotNull('data_nascimento')
            ->get();

        $format = function (User $user) use ($today): array {
            $birthDate = Carbon::parse($user->data_nascimento);

            return [
                'id' => (string) $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar,
                'role' => $user->roles->pluck('label')->join(', ') ?: 'Sem cargo',
                'age' => $today->year - $birthDate->year - (
                    $today->format('md') < $birthDate->format('md') ? 1 : 0
                ),
                'birthdayDay' => $birthDate->day,
                'birthdayDate' => $birthDate->format('Y-m-d'),
            ];
        };

        $current = $users->filter(fn (User $user) => Carbon::parse($user->data_nascimento)->month === $today->month)
            ->sortBy(fn (User $user) => Carbon::parse($user->data_nascimento)->day)
            ->values()
            ->map($format)
            ->all();
        $next = $users->filter(fn (User $user) => Carbon::parse($user->data_nascimento)->month === $nextMonth->month)
            ->sortBy(fn (User $user) => Carbon::parse($user->data_nascimento)->day)
            ->values()
            ->map($format)
            ->all();

        return response()->json([
            'success' => true,
            'data' => [
                'currentMonth' => $current,
                'nextMonth' => $next,
                'currentMonthLabel' => $monthNames[$today->month] . ' ' . $today->year,
                'nextMonthLabel' => $monthNames[$nextMonth->month] . ' ' . $nextMonth->year,
            ],
        ]);
    }
}
