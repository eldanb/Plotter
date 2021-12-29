#include <ESP8266WiFi.h>
#include <Adafruit_MotorShield.h>
#include <Servo.h>
#include "plotter.h"

Adafruit_MotorShield AFMS = Adafruit_MotorShield();

Adafruit_StepperMotor *xMotor = AFMS.getStepper(200, 1);
Adafruit_StepperMotor *yMotor = AFMS.getStepper(200, 2);
Servo penServo; 

#define X_STEP_MODE INTERLEAVE
#define Y_STEP_MODE INTERLEAVE

int currentX = 0;
int currentY = 0;

void plotterInit() {
  AFMS.begin();

  xMotor->setSpeed(20);  
  yMotor->setSpeed(20);  
  penServo.attach(D7); 

  plotterPenUp();
}

void plotterPenDown() {
  delay(100);
  penServo.write(70);
  delay(100);
}

void plotterPenUp() {
  delay(100);
  penServo.write(100);
  delay(100);
}

void plotterMoveTo(int x, int y) {
  int dX = x - currentX;
  int dY = y - currentY;
  
  int xdir = dX>0 ? FORWARD : BACKWARD;
  int ydir = dY>0 ? FORWARD : BACKWARD;

  dX = abs(dX);
  dY = abs(dY);

  if(!dX) {
    yMotor->step(dY, ydir, Y_STEP_MODE);
  } else 
  if(!dY) {
    xMotor->step(dX, xdir, X_STEP_MODE);
  } else 
  if(dY>=dX)
  {
    int numer = 0;
    int totalY = dY;
    while(totalY--) {
      yMotor->step(1, ydir, Y_STEP_MODE);
      numer += dX;
      if(numer >= dY) {
        numer -= dY;
        xMotor->step(1, xdir, X_STEP_MODE);
      }
    }
  } else // dX>dY 
  {
    int numer = 0;
    int totalX = dX;
    while(totalX--) {
      xMotor->step(1, xdir, X_STEP_MODE);
      numer += dY;
      if(numer >= dX) {
        numer -= dX;
        yMotor->step(1, ydir, Y_STEP_MODE);
      }
    }
  }  

  currentX = x;
  currentY = y;
}


void plotterArc(int xc, int yc, int xr, int yr, int startAngle, int endAngle) {
  plotterPenUp();
  plotterMoveTo(cos((float)startAngle/360 * 6.28)*xr+xc, sin((float)startAngle/360 * 6.28)*yr+yc);  
  plotterPenDown();  

  for(float angle=startAngle; angle<endAngle; angle+=10) {
    plotterMoveTo(cos((float)angle/360 * 6.28)*xr+xc, sin((float)angle/360 * 6.28)*yr+yc);  
  }

  plotterMoveTo(cos((float)endAngle/360 * 6.28)*xr+xc, sin((float)endAngle/360 * 6.28)*yr+yc);  
}

void plotterCircle(int xc, int yc, int r) {
  plotterArc(xc, yc, r, r, 0, 360);  
}


void plotterIsoPolygon(int xc, int yc, int r, int sides) {
  plotterPenUp();
  plotterMoveTo(r+xc, yc);  
  plotterPenDown();  

  for(int side=0; side<sides; side++) {
    plotterMoveTo(cos((float)side/sides * 6.28)*r+xc, sin((float)side/sides * 6.28)*r+yc);  
  }

  plotterMoveTo(r+xc, yc);  
}

void plotterDrawLines() {
  plotterPenDown();
  plotterMoveTo(50, 0);
  plotterMoveTo(50, 50);
  plotterMoveTo(0, 0);
  plotterMoveTo(100, 23);
  plotterMoveTo(77, 123);
  plotterPenUp();
}

void plotterDrawOlympics() {
  int r = 40;
  int s = 10;

  for(int i=0; i<3; i++) {
    plotterCircle((r+s) + i*(2*r+s), (r+s)/2, r);
  }

  for(int i=0; i<2; i++) {
    plotterCircle((r+s)+r+s/2 + (i)*(2*r+s), (r+s)/2+r, r);
  }

}