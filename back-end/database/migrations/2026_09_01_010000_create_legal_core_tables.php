<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('escritorios')) {
            Schema::create('escritorios', function (Blueprint $table) {
                $table->id();
                $table->string('nome');
                $table->string('razao_social')->nullable();
                $table->string('cnpj', 14)->nullable()->unique();
                $table->string('email')->nullable();
                $table->string('telefone', 20)->nullable();
                $table->string('cep', 8)->nullable();
                $table->string('logradouro')->nullable();
                $table->string('numero', 20)->nullable();
                $table->string('complemento')->nullable();
                $table->string('bairro')->nullable();
                $table->string('cidade')->nullable();
                $table->string('estado', 2)->nullable();
                $table->string('status', 20)->default('active')->index();
                $table->softDeletes();
                $table->timestamps();
            });
        }

        DB::table('escritorios')->updateOrInsert(
            ['cnpj' => '00000000000000'],
            [
                'nome' => 'Escritório Principal',
                'razao_social' => 'Escritório Principal',
                'status' => 'active',
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
        $escritorioPrincipalId = DB::table('escritorios')->where('cnpj', '00000000000000')->value('id');

        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'escritorio_id')) {
                $table->foreignId('escritorio_id')->nullable()->after('id');
            }
        });

        DB::table('users')
            ->whereNull('escritorio_id')
            ->orWhere('escritorio_id', 0)
            ->update(['escritorio_id' => $escritorioPrincipalId]);

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('escritorio_id')->references('id')->on('escritorios')->restrictOnDelete();
        });

        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escritorio_id')->constrained('escritorios')->restrictOnDelete();
            $table->string('tipo_pessoa', 2)->index();
            $table->string('nome')->nullable();
            $table->string('razao_social')->nullable();
            $table->string('nome_fantasia')->nullable();
            $table->string('cpf', 11)->nullable()->unique();
            $table->string('cnpj', 14)->nullable()->unique();
            $table->string('rg', 30)->nullable();
            $table->date('data_nascimento')->nullable();
            $table->string('email')->nullable();
            $table->string('telefone', 20)->nullable();
            $table->string('celular', 20)->nullable();
            $table->string('whatsapp', 20)->nullable();
            $table->string('cep', 8)->nullable();
            $table->string('logradouro')->nullable();
            $table->string('numero', 20)->nullable();
            $table->string('complemento')->nullable();
            $table->string('bairro')->nullable();
            $table->string('cidade')->nullable();
            $table->string('estado', 2)->nullable();
            $table->text('observacoes')->nullable();
            $table->string('status', 20)->default('active')->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['escritorio_id', 'nome']);
            $table->index(['escritorio_id', 'razao_social']);
        });

        Schema::create('advogados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escritorio_id')->constrained('escritorios')->restrictOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nome');
            $table->string('cpf', 11)->nullable();
            $table->string('email')->nullable();
            $table->string('telefone', 20)->nullable();
            $table->string('celular', 20)->nullable();
            $table->string('oab_numero', 30);
            $table->string('oab_uf', 2);
            $table->string('especialidade')->nullable()->index();
            $table->string('status', 20)->default('active')->index();
            $table->text('observacoes')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->unique(['escritorio_id', 'oab_numero', 'oab_uf']);
            $table->unique(['escritorio_id', 'user_id']);
            $table->index(['escritorio_id', 'nome']);
        });

        Schema::create('status_processos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escritorio_id')->constrained('escritorios')->restrictOnDelete();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->string('cor', 20)->default('#64748b');
            $table->unsignedInteger('ordem')->default(0);
            $table->boolean('ativo')->default(true)->index();
            $table->timestamps();
            $table->unique(['escritorio_id', 'nome']);
            $table->unique(['escritorio_id', 'ordem']);
        });

        Schema::create('processos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('escritorio_id')->constrained('escritorios')->restrictOnDelete();
            $table->foreignId('cliente_id')->constrained('clientes')->restrictOnDelete();
            $table->string('numero_processo', 25)->unique();
            $table->string('titulo');
            $table->text('descricao')->nullable();
            $table->string('tribunal')->nullable();
            $table->string('comarca')->nullable();
            $table->string('vara')->nullable();
            $table->string('foro')->nullable();
            $table->string('tipo_acao')->nullable()->index();
            $table->string('area_juridica')->nullable()->index();
            $table->string('assunto')->nullable();
            $table->foreignId('status_id')->constrained('status_processos')->restrictOnDelete();
            $table->date('data_distribuicao')->nullable();
            $table->date('data_abertura')->nullable();
            $table->date('data_encerramento')->nullable();
            $table->decimal('valor_causa', 15, 2)->nullable();
            $table->decimal('valor_honorarios', 15, 2)->nullable();
            $table->text('observacoes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['escritorio_id', 'cliente_id']);
            $table->index(['escritorio_id', 'status_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('processos');
        Schema::dropIfExists('status_processos');
        Schema::dropIfExists('advogados');
        Schema::dropIfExists('clientes');

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('escritorio_id');
        });

        Schema::dropIfExists('escritorios');
    }
};
