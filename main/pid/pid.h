#ifndef PID_H
#define PID_H

#include <stdint.h>

typedef struct
{
    float kp;         // Współczynnik proporcjonalny
    float ki;         // Współczynnik całkujący
    float kd;         // Współczynnik różniczkujący
    float setpoint;   // Docelowa wartość
    float prev_error; // Poprzedni błąd
    float integral;   // Całkowity błąd
    float output;     // Wynik (moc grzałki)
} PID_t;

void pid_init(PID_t *pid, float kp, float ki, float kd, float setpoint);

float pid_compute(PID_t *pid, float current_value);

#endif // PID_H
