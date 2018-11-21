public abstract class ThisClass {
    private void hold() {
        hold();
        afterHold(true);
    }

    public String[] getArgs() { return null; }

    static hahaha(String arg) {
        callWithArg(arg);
    }
}