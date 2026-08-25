// TYPE NAME(PARAMS) {}
void main () {

  var Minhaclasse = MinhaClasse();
  printHelloWorld(message: Minhaclasse.message);
}

void printHelloWorld ({required String message}) {
  print(message);
}

//class NomeDaFuncao {}

class MinhaClasse {
  String message = "DEU CERTO";
}
