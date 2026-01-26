# Миграции

Миграции будут созданы автоматически командой:
```bash
python manage.py makemigrations
```

После создания миграций нужно создать data migration для начальных ролей:
```bash
python manage.py makemigrations --empty persistence --name initial_roles
```

Затем в созданном файле миграции добавить код для создания ролей (owner, assistant, editor, client).
