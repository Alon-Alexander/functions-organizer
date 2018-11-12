console.log("this is the begining");

function func1(arg1, arg2) {
  console.log(arg1);
  arg1.print(arg2);
}

console.log("now");

function func2() {
  console.log("before");
  outFunc();
  console.log("after");
}

function anotherFunc({ obj: object }) {
  obj["abc"] = "d";
}

func1();
