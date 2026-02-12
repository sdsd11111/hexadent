# Guía de Pruebas de Regresión - Hexadent

Para asegurar que los cambios futuros no rompan las reglas críticas de la clínica, hemos implementado una suite de pruebas automáticas.

## Cómo correr las pruebas
Desde la terminal del proyecto, ejecuta:
```powershell
node tests/regression_tests.mjs
```

## Qué verifican estas pruebas:
1. **Regla de 24 Horas**: Verifica que no se ofrezcan horarios dentro del margen de 24 horas desde el momento actual.
2. **Cierre de Sábados**: Verifica que a las 15:00 (3 PM) el sistema bloquee cualquier cita en sábado.
3. **Domingos**: Verifica que no haya disponibilidad los domingos.

## Antes de cada actualización:
Es una buena práctica correr estas pruebas localmente. Si alguna falla (`❌ TEST FAILED`), el código no es seguro para subir a producción.
