#!/bin/bash
# /usr/local/bin/backup_postgres.sh

BACKUP_DIR="/var/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="psychology_prod"
BACKUP_FILE="${BACKUP_DIR}/backup_${DATE}.sql.gz"
ENCRYPTED_FILE="${BACKUP_DIR}/backup_${DATE}.sql.gz.enc"
RETENTION_DAYS=30

# Создание бэкапа
pg_dump -h localhost -U psychology_user -d $DB_NAME | \
    gzip > $BACKUP_FILE

# Шифрование
openssl enc -aes-256-cbc -salt -in $BACKUP_FILE -out $ENCRYPTED_FILE \
    -pass file:/etc/backup_key.txt

# Удаление незашифрованного файла
rm $BACKUP_FILE

# Загрузка в S3 (опционально)
# aws s3 cp $ENCRYPTED_FILE s3://psychology-backups/postgres/

# Очистка старых бэкапов
find $BACKUP_DIR -name "backup_*.sql.gz.enc" -mtime +$RETENTION_DAYS -delete

# Логирование
echo "$(date): Backup completed: $ENCRYPTED_FILE" >> /var/log/backup.log

---
*Документ создан: DevOps Agent*
---
