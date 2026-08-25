# Aula 01 - Fundamentos do Flutter

Nesta aula, exploramos a criação de um aplicativo de contador, entendendo a estrutura básica de um projeto Flutter, componentes de layout e a diferença crucial entre Widgets estáticos e dinâmicos.

## 1. Estrutura Inicial do App

Todo app Flutter começa pelo método `main` e pelo widget raiz.

- **`runApp`**: Inicia o ciclo de vida do Flutter.
- **`MaterialApp`**: Define que o app seguirá o **Material Design**. É aqui que configuramos temas e a tela inicial (`home`).

```dart
void main() {
  runApp(
    MaterialApp(
      home: HomePage() // Nossa tela principal
    ),
  );
}
```

---

## 2. O Layout com Scaffold

O `Scaffold` é o "esqueleto" de uma tela baseada em Material Design. Ele fornece áreas pré-definidas:

- **`appBar`**: A barra superior.
- **`body`**: A área de conteúdo principal.
- **`floatingActionButton`**: O botão circular que fica flutuando na tela.

---

## 3. Widgets Utilizados

| Widget | Função | Exemplo no Projeto |
| :--- | :--- | :--- |
| **`AppBar`** | Cabeçalho da página | Título "Meu Primeiro App" |
| **`Center`** | Centraliza o conteúdo | Envolve o texto do contador |
| **`Text`** | Exibe strings na tela | `Text("Contador \n $count")` |
| **`FloatingActionButton`** | Botão de ação rápida | Botão de "+" no canto inferior |
| **`Icon`** | Exibe símbolos visuais | `Icon(Icons.add)` |

---

## 4. Stateless vs. Stateful

Este foi o maior aprendizado da aula:

### StatelessWidget (Estático)
- A interface **não muda** após ser construída.
- Se você mudar uma variável (ex: `count++`), a tela **não** será atualizada.

### StatefulWidget (Dinâmico)
- A interface **pode mudar** durante a execução.
- É dividido em duas classes: o Widget em si e o seu **Estado (`State`)**.

### O Papel do `setState`
O método `setState(() {})` é o que avisa ao Flutter que houve uma mudança na lógica e que ele precisa rodar o método `build` novamente para atualizar o que o usuário vê.

```dart
// Exemplo de incremento com atualização de tela
void increment() {
  setState(() {
    count++; // Altera o valor e manda o Flutter "re-desenhar"
  });
}
```

---

## 5. Estilização: Analogia com Web

Aprendemos que o Flutter moderno (Material 3) separa bem as estilizações:

- **Estilização Global (CSS/Bootstrap):** Definida no `ThemeData` do `MaterialApp`.
- **Estilização Local (Tailwind/Inline):** Definida diretamente nas propriedades do widget.
  - Exemplo: `backgroundColor: Colors.purple` dentro do `AppBar`.

> [!TIP]
> No Material 3, o `AppBar` não fica roxo por padrão apenas com o tema primário. É necessário definir explicitamente a cor ou ajustar o `appBarTheme`.

---

## Código Final da Aula

```dart
class _HomePageState extends State<HomePage> {
  var count = 0;

  void increment() {
    count++;
    setState(() {}); // Atualiza a tela
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.purple,
        foregroundColor: Colors.white,
        title: Text("Meu Primeiro App"),
      ),
      body: Center(child: Text("Contador \n $count", textAlign: TextAlign.center)),
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.purple,
        foregroundColor: Colors.white,
        child: Icon(Icons.add),
        onPressed: increment,
      ),
    );
  }
}
```
