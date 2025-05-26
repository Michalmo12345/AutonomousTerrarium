
#include "pid.h"

#include <stdio.h>

void pid_init(PID_t *pid, float kp, float ki, float kd, float setpoint)
{
    pid->kp = kp;
    pid->ki = ki;
    pid->kd = kd;
    pid->setpoint = setpoint;
    pid->prev_error = 0.0f;
    pid->integral = 0.0f;
    pid->output = 0.0f;
}

float pid_compute(PID_t *pid, float current_value)
{
    float error = pid->setpoint - current_value;
    pid->integral += error;
    float derivative = error - pid->prev_error;
    pid->output = (pid->kp * error) + (pid->ki * pid->integral) + (pid->kd * derivative);
    pid->prev_error = error;
    if (pid->output > 100.0)
    {
        pid->output = 100.0;
    }
    else if (pid->output < 0.0)
    {
        pid->output = 0.0;
    }

    return pid->output;
}