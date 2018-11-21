public abstract class ThisClass {
    public String[] getArgs() { return null; }

    static hahaha(String arg) {
        callWithArg(arg);
    }

    private void hold() {
        hold();
        afterHold(true);
    }
}