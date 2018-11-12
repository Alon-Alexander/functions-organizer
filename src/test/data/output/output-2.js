console.log("this is the begining");

function anotherFunc({ obj: object }) {
  obj["abc"] = "d";
}

console.log("now");

function func1(arg1, arg2) {
  console.log(arg1);
  arg1.print(arg2);
}

function func2() {
  console.log("before");
  outFunc();
  console.log("after");
}

func1();
