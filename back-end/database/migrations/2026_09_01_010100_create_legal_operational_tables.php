<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('processo_advogados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('processo_id')->constrained('processos')->restrictOnDelete();
            $table->foreignId('advogado_id')->constrained('advogados')->restrictOnDelete();
            $table->string('tipo', 30);
            $table->boolean('principal')->default(false);
            $table->timestamps();
            $table->unique(['processo_id', 'advogado_id']);
            $table->index(['processo_id', 'principal']);
        });

        Schema::create('processo_responsaveis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('processo_id')->constrained('processos')->restrictOnDelete();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->string('tipo', 30);
            $table->boolean('principal')->default(false);
            $table->timestamps();
            $table->unique(['processo_id', 'user_id']);
            $table->index(['processo_id', 'principal']);
        });

        Schema::create('processo_movimentacoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escritorio_id')->constrained('escritorios')->restrictOnDelete();
            $table->foreignId('processo_id')->constrained('processos')->restrictOnDelete();
            $table->date('data_movimentacao')->index();
            $table->string('tipo', 30);
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->foreignId('responsavel_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('origem', 20)->default('manual');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['processo_id', 'data_movimentacao']);
        });

        Schema::create('processo_prazos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escritorio_id')->constrained('escritorios')->restrictOnDelete();
            $table->foreignId('processo_id')->constrained('processos')->restrictOnDelete();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->date('data_inicio')->nullable();
            $table->date('data_vencimento')->index();
            $table->foreignId('responsavel_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('pendente')->index();
            $table->string('prioridade', 20)->default('media')->index();
            $table->timestamp('concluido_em')->nullable();
            $table->text('observacoes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['processo_id', 'status']);
        });

        Schema::create('tarefas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escritorio_id')->constrained('escritorios')->restrictOnDelete();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->foreignId('processo_id')->nullable()->constrained('processos')->nullOnDelete();
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
            $table->foreignId('responsavel_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('criador_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('prioridade', 20)->default('media')->index();
            $table->string('status', 20)->default('a_fazer')->index();
            $table->date('data_inicio')->nullable();
            $table->date('data_vencimento')->nullable()->index();
            $table->timestamp('concluido_em')->nullable();
            $table->text('observacoes')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['escritorio_id', 'responsavel_id', 'status']);
        });

        Schema::create('agenda_eventos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escritorio_id')->constrained('escritorios')->restrictOnDelete();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->string('tipo', 30)->index();
            $table->dateTime('data_inicio')->index();
            $table->dateTime('data_fim')->nullable();
            $table->string('local')->nullable();
            $table->foreignId('processo_id')->nullable()->constrained('processos')->nullOnDelete();
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
            $table->foreignId('responsavel_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('agendado')->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['escritorio_id', 'data_inicio']);
        });

        Schema::create('contratos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escritorio_id')->constrained('escritorios')->restrictOnDelete();
            $table->foreignId('cliente_id')->constrained('clientes')->restrictOnDelete();
            $table->foreignId('processo_id')->nullable()->constrained('processos')->nullOnDelete();
            $table->string('numero')->index();
            $table->text('descricao')->nullable();
            $table->date('data_inicio');
            $table->date('data_fim')->nullable();
            $table->decimal('valor_total', 15, 2);
            $table->string('forma_pagamento', 30);
            $table->string('status', 20)->default('rascunho')->index();
            $table->text('observacoes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
            $table->unique(['escritorio_id', 'numero']);
        });

        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escritorio_id')->constrained('escritorios')->restrictOnDelete();
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
            $table->foreignId('processo_id')->nullable()->constrained('processos')->nullOnDelete();
            $table->foreignId('contrato_id')->nullable()->constrained('contratos')->nullOnDelete();
            $table->string('nome');
            $table->string('nome_original');
            $table->string('tipo', 100);
            $table->string('categoria', 50)->index();
            $table->string('arquivo');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('tamanho');
            $table->text('descricao')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['escritorio_id', 'categoria']);
        });

        Schema::create('parcelas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escritorio_id')->constrained('escritorios')->restrictOnDelete();
            $table->foreignId('contrato_id')->constrained('contratos')->restrictOnDelete();
            $table->unsignedInteger('numero');
            $table->string('descricao')->nullable();
            $table->decimal('valor', 15, 2);
            $table->date('data_vencimento')->index();
            $table->date('data_pagamento')->nullable();
            $table->string('status', 20)->default('pendente')->index();
            $table->string('forma_pagamento', 30)->nullable();
            $table->text('observacoes')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->unique(['contrato_id', 'numero']);
        });

        Schema::create('pagamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escritorio_id')->constrained('escritorios')->restrictOnDelete();
            $table->foreignId('parcela_id')->constrained('parcelas')->restrictOnDelete();
            $table->decimal('valor', 15, 2);
            $table->date('data_pagamento')->index();
            $table->string('forma_pagamento', 30);
            $table->string('comprovante')->nullable();
            $table->text('observacoes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('pagamentos');
        Schema::dropIfExists('parcelas');
        Schema::dropIfExists('documentos');
        Schema::dropIfExists('contratos');
        Schema::dropIfExists('agenda_eventos');
        Schema::dropIfExists('tarefas');
        Schema::dropIfExists('processo_prazos');
        Schema::dropIfExists('processo_movimentacoes');
        Schema::dropIfExists('processo_responsaveis');
        Schema::dropIfExists('processo_advogados');
    }
};
