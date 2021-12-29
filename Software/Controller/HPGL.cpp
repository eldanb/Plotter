#include "HPGL.h"
#include <stdlib.h>
#include <string.h>
#include <exception>
#include <ESP8266WiFi.h>

struct CommandHandlerArgs {
    PlotterInterface *plotter;
    const char *params;
    char separator;
};

typedef void (*CommandHandlerFn)(CommandHandlerArgs* params);

struct CommandHandler {
    const char *command;
    CommandHandlerFn fn;
};

extern CommandHandler COMMAND_HANDLERS[];

static bool eatParameter(CommandHandlerArgs* params, char *output, int outputLen);
static void traceMoveArgs(CommandHandlerArgs* params);
static void abortOnError(const char *error);

static CommandHandler *findCommandHandler(const char *command) {
    CommandHandler *ret = COMMAND_HANDLERS;
    while(ret->command && strncmp(ret->command, command, 2)) {
        ret++;
    }

    return ret->command ? ret : NULL;
}

void runHpgl(const char *hpgl, PlotterInterface *plotter) {

    CommandHandlerArgs currentCommandArgs;
    currentCommandArgs.plotter = plotter;
    currentCommandArgs.separator = ';';

    while(*hpgl) {
        CommandHandler *cmd = findCommandHandler(hpgl);
        if(!cmd) {
            abortOnError("Invalid command");
        }

        hpgl+=2;
        currentCommandArgs.params = hpgl;

        cmd->fn(&currentCommandArgs);
        int numEaten = currentCommandArgs.params - hpgl;

        hpgl += numEaten;
        while(*hpgl == currentCommandArgs.separator)
            hpgl++;
    }    
}

static void CommandHandlerIN(CommandHandlerArgs* params) {
}

static void CommandHandlerSP(CommandHandlerArgs* params) {
    eatParameter(params, NULL, 0);
}

static void CommandHandlerPD(CommandHandlerArgs* params) {
    params->plotter->penDown();
    traceMoveArgs(params);        
}

static void CommandHandlerPU(CommandHandlerArgs* params) {
    params->plotter->penUp();
    traceMoveArgs(params);        
}

static void traceMoveArgs(CommandHandlerArgs* params) {
    char argBuff[32];

    while(eatParameter(params, argBuff, 32)) {
        int xCoord = atoi(argBuff);
        if(!eatParameter(params, argBuff, 32)) {
            abortOnError("Expecting even number of coordinates for path");
        }
        int yCoord = atoi(argBuff);

        params->plotter->moveTo(xCoord, yCoord);
    }
}

static bool eatParameter(CommandHandlerArgs* params, char *output, int outputLen) {
    char curChar = *(params->params);
    if(curChar == params->separator || !curChar) {
        return false;
    }

    while(curChar && curChar != ',' && curChar != params->separator) {
        if(output && outputLen>1) {
            *output = curChar;
            output++;
            outputLen--;
        }

        params->params++;
        curChar = *(params->params);
    }

    if(output) *output = 0;

    if(curChar == ',') {
        params->params++;
    }

    return true;
}

CommandHandler COMMAND_HANDLERS[] = {
    { "IN", CommandHandlerIN },
    { "PU", CommandHandlerPU },
    { "SP", CommandHandlerSP },
    { "PD", CommandHandlerPD },
    { NULL, NULL }
};

static void abortOnError(const char *error) {
    while(1) { yield(); }
}
