import 'package:flutter/material.dart';

void main() {
  // Recebe um Widget
  // Widget é tudo que temos de visual na tela, o contrutor
  runApp(
    MaterialApp(
      home: HomePage()
    ),
  );
}

class HomePage extends StatefulWidget {

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  var count = 0;

  void increment() {
    count++;
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Scaffold é o Layout da aplicação, seguindo padrões de web development
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
        onPressed: () {
          increment();
        },
      ),
    );
    throw UnimplementedError();
  }
}
