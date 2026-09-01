# Rascunho: como criar uma nova tela CRUD

Este é um roteiro para criar um novo módulo nesta estrutura Laravel + React. O exemplo é **Pessoas**, com os campos `nome`, `idade` e `cpf`.

> Este documento é apenas um guia. Não crie os arquivos abaixo sem adaptar nomes, regras de negócio e permissões ao módulo real.

## Resultado esperado

O módulo deve entregar:

- tela responsiva e protegida por permissões;
- criar, listar, visualizar, editar, excluir e exportar;
- busca, ordenação, paginação e **5 linhas por página** como padrão;
- RBAC no front-end e no back-end;
- validação no servidor;
- auditoria de ações relevantes.

## 1. Defina as permissões

Use o padrão `<módulo>.<ação>`. Para Pessoas:

```php
// back-end/database/seeders/RbacDatabaseSeeder.php
['name' => 'people.view',   'label' => 'Visualizar Pessoas', 'module' => 'people'],
['name' => 'people.create', 'label' => 'Criar Pessoas',      'module' => 'people'],
['name' => 'people.edit',   'label' => 'Editar Pessoas',     'module' => 'people'],
['name' => 'people.delete', 'label' => 'Excluir Pessoas',    'module' => 'people'],
['name' => 'people.export', 'label' => 'Exportar Pessoas',   'module' => 'people'],
```

Execute o seeder conforme o procedimento atual do projeto. Não conceda essas permissões a perfis comuns automaticamente. O perfil `admin` recebe acesso total pelo comportamento RBAC atual.

## 2. Crie a migration

Arquivo: `back-end/database/migrations/AAAA_MM_DD_HHMMSS_create_people_table.php`

```php
Schema::create('people', function (Blueprint $table) {
    $table->id();
    $table->string('name', 255);
    $table->unsignedSmallInteger('age');
    $table->string('cpf', 14)->unique();
    $table->timestamps();
    $table->softDeletes(); // Use se exclusão lógica fizer sentido no módulo.
});
```

Inclua sempre o método `down()` reversível:

```php
public function down(): void
{
    Schema::dropIfExists('people');
}
```

Depois, execute a migration no ambiente correto.

## 3. Crie o model

Arquivo: `back-end/app/Models/Person.php`

```php
class Person extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'age', 'cpf'];
}
```

CPF é dado pessoal: nunca o coloque em logs de auditoria, mensagens de erro ou exportações sem verificar a necessidade e a permissão adequada.

## 4. Crie os requests de validação

Arquivos:

- `back-end/app/Http/Requests/Person/StorePersonRequest.php`
- `back-end/app/Http/Requests/Person/UpdatePersonRequest.php`

Exemplo de regras para criação:

```php
public function authorize(): bool
{
    return $this->user()->can('create', Person::class);
}

public function rules(): array
{
    return [
        'name' => ['required', 'string', 'min:3', 'max:255'],
        'age' => ['required', 'integer', 'min:0', 'max:130'],
        'cpf' => ['required', 'string', 'regex:/^\\d{3}\\.?(\\d{3})\\.?(\\d{3})-?(\\d{2})$/', 'unique:people,cpf'],
    ];
}
```

No request de atualização, use `Rule::unique('people', 'cpf')->ignore($personId)`. Se a regra de negócio exigir CPF válido de verdade, implemente um validador de dígitos verificadores; o `regex` acima valida somente o formato.

## 5. Crie a policy

Arquivo: `back-end/app/Policies/PersonPolicy.php`

```php
class PersonPolicy
{
    public function viewAny(User $user): bool { return $user->hasPermission('people.view'); }
    public function view(User $user, Person $person): bool { return $user->hasPermission('people.view'); }
    public function create(User $user): bool { return $user->hasPermission('people.create'); }
    public function update(User $user, Person $person): bool { return $user->hasPermission('people.edit'); }
    public function delete(User $user, Person $person): bool { return $user->hasPermission('people.delete'); }
    public function export(User $user): bool { return $user->hasPermission('people.export'); }
}
```

Se o módulo tiver escopo por empresa, filial ou dono do registro, aplique essa restrição também na policy e em todas as consultas. Nunca deixe essa decisão apenas no front-end.

## 6. Centralize regras no service e audite ações

Arquivo: `back-end/app/Services/PersonService.php`

O service deve concentrar paginação, campos permitidos para ordenação, criação, edição, exclusão e auditoria. Exemplo resumido:

```php
private const SORTABLE_COLUMNS = [
    'name' => 'name', 'age' => 'age', 'createdAt' => 'created_at',
];

public function create(array $data, User $actor): Person
{
    return DB::transaction(function () use ($data, $actor) {
        $person = Person::create($data);

        ActivityLog::create([
            'user_id' => $actor->id,
            'action' => 'created',
            'module' => 'people',
            'description' => "Pessoa {$person->name} cadastrada",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'details' => ['person_id' => $person->id], // Não registre o CPF.
        ]);

        return $person;
    });
}
```

Na listagem, aceite somente colunas presentes em `SORTABLE_COLUMNS`, normalize a direção para `asc`/`desc` e aplique busca e paginação no banco. Repita a auditoria para atualização, exclusão e exportação.

## 7. Crie o resource e controller

Arquivo: `back-end/app/Http/Resources/PersonResource.php`

```php
public function toArray(Request $request): array
{
    return [
        'id' => (string) $this->id,
        'name' => $this->name,
        'age' => $this->age,
        // Só devolva CPF se isso for realmente necessário e autorizado.
        'cpf' => $this->cpf,
        'createdAt' => $this->created_at?->toISOString(),
        'updatedAt' => $this->updated_at?->toISOString(),
    ];
}
```

Arquivo: `back-end/app/Http/Controllers/Api/PersonController.php`

```php
public function index(Request $request): JsonResponse
{
    $this->authorize('viewAny', Person::class);
    // Chame o service com search, sortColumn, sortDirection, page e perPage.
}

public function store(StorePersonRequest $request): JsonResponse
{
    $this->authorize('create', Person::class);
    $person = $this->service->create($request->validated(), $request->user());
    return (new PersonResource($person))->additional(['success' => true])->response()->setStatusCode(201);
}

public function update(UpdatePersonRequest $request, Person $person): JsonResponse
{
    $this->authorize('update', $person);
    // Atualize pelo service e retorne PersonResource.
}

public function destroy(Request $request, Person $person): JsonResponse
{
    $this->authorize('delete', $person);
    // Exclua pelo service, audite e retorne { success: true }.
}
```

Mantenha o contrato de resposta do projeto: `success`, `message`, `data` e `meta` para paginação.

## 8. Cadastre as rotas da API

Arquivo: `back-end/routes/api.php`, dentro do grupo `auth:sanctum`:

```php
Route::get('people/export', [PersonController::class, 'export']);
Route::apiResource('people', PersonController::class);
```

No método `export`, autorize `export`, aplique o mesmo escopo/filtros permitidos da listagem, gere o arquivo de forma segura e registre a auditoria. Defina a rota de exportação antes da rota resource para evitar conflito com `{person}`.

## 9. Crie a tela React e proteja a rota

Arquivos típicos:

- `front-end/src/views/PeopleView.tsx`
- `front-end/src/types/index.ts`
- arquivo de rotas/navegação usado pelo projeto;
- `front-end/src/context/AuthContext.tsx`.

Tipo básico:

```ts
export interface Person {
  id: string;
  name: string;
  age: number;
  cpf: string;
  createdAt: string;
  updatedAt: string;
}
```

No `AuthContext.tsx`, cadastre a rota:

```ts
'/people': 'people.view',
```

Na tela, siga `UsersView.tsx` como referência:

```tsx
const { can } = useAuth();

if (!can('people.view')) {
  return <ForbiddenShield requiredPermission="people.view" message="Você não possui permissão para visualizar Pessoas." />;
}

const [perPage, setPerPage] = useState(5); // Padrão obrigatório.

{can('people.create') && <Button onClick={handleOpenAdd}>Nova Pessoa</Button>}
{can('people.export') && <Button onClick={handleExport}>Exportar</Button>}
```

Use os componentes existentes `Table`, `Pagination`, `Modal`, `ConfirmationDialog`, `Input`, `Button` e `Toast`. A tabela deve enviar busca, filtros, ordenação, página e `perPage` à API. Esconda ações sem permissão, mas preserve a autorização obrigatória no servidor.

## 10. Checklist antes de entregar

- [ ] Migration reversível criada e aplicada.
- [ ] Permissões criadas em seeder e visíveis na tela de perfis.
- [ ] Policy e requests protegem todas as ações no back-end.
- [ ] Listagem possui busca, ordenação, paginação e 5 linhas por padrão.
- [ ] Criar, visualizar, editar, excluir e exportar estão implementados quando aplicáveis.
- [ ] Ações sensíveis possuem auditoria sem dados pessoais desnecessários.
- [ ] A tela é responsiva, tem estados de loading/vazio/erro e confirmação de exclusão.
- [ ] O usuário só vê telas e ações permitidas pelo seu perfil.
- [ ] Lint, typecheck, testes e/ou build apropriados foram executados.
