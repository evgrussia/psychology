#!/bin/bash
# /usr/local/bin/restore_postgres.sh

BACKUP_FILE=$1
DECRYPTED_FILE="${BACKUP_FILE%.enc}"

# Расшифровка
openssl enc -aes-256-cbc -d -in $BACKUP_FILE -out $DECRYPTED_FILE \
    -pass file:/etc/backup_key.txt

# Восстановление
gunzip < $DECRYPTED_FILE | psql -h localhost -U psychology_user -d psychology_prod

# Очистка
rm $DECRYPTED_FILE
