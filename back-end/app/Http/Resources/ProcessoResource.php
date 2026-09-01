<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcessoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'numeroProcesso' => $this->numero_processo,
            'titulo' => $this->titulo,
            'descricao' => $this->descricao,
            'tribunal' => $this->tribunal,
            'comarca' => $this->comarca,
            'vara' => $this->vara,
            'foro' => $this->foro,
            'tipoAcao' => $this->tipo_acao,
            'areaJuridica' => $this->area_juridica,
            'assunto' => $this->assunto,
            'dataDistribuicao' => $this->data_distribuicao?->format('Y-m-d'),
            'dataAbertura' => $this->data_abertura?->format('Y-m-d'),
            'dataEncerramento' => $this->data_encerramento?->format('Y-m-d'),
            'valorCausa' => $this->valor_causa,
            'valorHonorarios' => $this->valor_honorarios,
            'observacoes' => $this->observacoes,
            'cliente' => new ClienteResource($this->whenLoaded('cliente')),
            'status' => new StatusProcessoResource($this->whenLoaded('status')),
            'advogados' => AdvogadoResource::collection($this->whenLoaded('advogados')),
            'responsaveis' => UserResource::collection($this->whenLoaded('responsaveis')),
            'movimentacoes' => ProcessoMovimentacaoResource::collection($this->whenLoaded('movimentacoes')),
            'prazos' => ProcessoPrazoResource::collection($this->whenLoaded('prazos')),
            'tarefas' => TarefaResource::collection($this->whenLoaded('tarefas')),
            'eventosAgenda' => AgendaEventoResource::collection($this->whenLoaded('eventosAgenda')),
            'documentos' => DocumentoResource::collection($this->whenLoaded('documentos')),
            'contratos' => ContratoResource::collection($this->whenLoaded('contratos')),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
