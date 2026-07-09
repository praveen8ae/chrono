from django.contrib import admin

from .models import Assignment, Employee, ShiftChange, ShiftSwap

admin.site.register(Employee)
admin.site.register(Assignment)
admin.site.register(ShiftChange)
admin.site.register(ShiftSwap)
