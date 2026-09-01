<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class JuridicoNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly string $tipo, private readonly string $titulo, private readonly string $mensagem, private readonly array $contexto = []) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return ['tipo' => $this->tipo, 'titulo' => $this->titulo, 'mensagem' => $this->mensagem, 'contexto' => $this->contexto];
    }
}
