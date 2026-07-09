from django.db import models


class ShiftType(models.TextChoices):
    SHIFT_1 = 'shift1', 'Shift 1'
    SHIFT_2 = 'shift2', 'Shift 2'
    SHIFT_3 = 'shift3', 'Shift 3'


class AssignmentStatus(models.TextChoices):
    SCHEDULED = 'scheduled', 'Scheduled'
    PRESENT = 'present', 'Present'
    HALF_DAY = 'half-day', 'Half Day'
    ABSENT = 'absent', 'Absent'
    OFF = 'off', 'Off'
    LEAVE = 'leave', 'Leave'


class Employee(models.Model):
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=80)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    department = models.CharField(max_length=120)
    assigned_shift = models.CharField(max_length=16, choices=ShiftType.choices, blank=True, null=True)
    avatar = models.URLField(blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self) -> str:
        return f'{self.name} ({self.email})'


class Assignment(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='assignments')
    date = models.DateField()
    shift_type = models.CharField(max_length=16, choices=ShiftType.choices, blank=True, null=True)
    status = models.CharField(max_length=16, choices=AssignmentStatus.choices)
    message_count = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-date', 'employee__name']
        unique_together = ['employee', 'date']

    def __str__(self) -> str:
        return f'{self.employee.name} - {self.date}'


class ShiftChange(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='shift_changes')
    from_shift = models.CharField(max_length=16, choices=ShiftType.choices)
    to_shift = models.CharField(max_length=16, choices=ShiftType.choices)
    reason = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']


class ShiftSwap(models.Model):
    employee_1 = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='swap_as_employee_1')
    employee_1_date = models.DateField()
    employee_2 = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='swap_as_employee_2')
    employee_2_date = models.DateField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
