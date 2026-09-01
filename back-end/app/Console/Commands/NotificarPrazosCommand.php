<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use App\Models\ProcessoPrazo;
use App\Notifications\JuridicoNotification;
use Illuminate\Console\Command;

class NotificarPrazosCommand extends Command
{
    protected $signature = 'juridico:notificar-prazos';

    protected $description = 'Notifica responsáveis por prazos próximos ou vencidos';

    public function handle(): int
    {
        $prazos = ProcessoPrazo::query()
            ->with('responsavel')
            ->whereNotNull('responsavel_id')
            ->whereNotIn('status', ['concluido', 'cancelado'])
            ->whereDate('data_vencimento', '<=', now()->addDays(3))
            ->get();

        foreach ($prazos as $prazo) {
            $vencido = $prazo->data_vencimento->isPast();
            $tipo = $vencido ? 'prazo_vencido' : 'prazo_proximo';
            $prazo->responsavel->notify(new JuridicoNotification($tipo, $vencido ? 'Prazo vencido' : 'Prazo próximo', $prazo->titulo, ['prazo_id' => $prazo->id, 'processo_id' => $prazo->processo_id, 'data_vencimento' => $prazo->data_vencimento->toDateString()]));
            ActivityLog::create(['user_id' => null, 'action' => 'notified', 'module' => 'processo-prazos', 'description' => 'Notificação de prazo enviada.', 'details' => ['prazo_id' => $prazo->id, 'tipo' => $tipo]]);
        }

        $this->info("{$prazos->count()} notificações de prazo enviadas.");

        return self::SUCCESS;
    }
}
