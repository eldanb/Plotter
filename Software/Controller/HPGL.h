class PlotterInterface {
public:
    virtual void penDown() = 0;
    virtual void penUp() = 0;
    virtual void moveTo(int x, int y) = 0;
};

void runHpgl(const char *hpgl, PlotterInterface *plotter);