# Multi-purpose runtime Dockerfile for SMCAS microservices
FROM eclipse-temurin:21-jre-alpine

ARG SERVICE_NAME
WORKDIR /app

# Security: Non-root user
RUN addgroup -S smcas && adduser -S smcas -G smcas

# Copy pre-compiled microservice JAR
COPY ${SERVICE_NAME}/target/${SERVICE_NAME}-1.0.0-SNAPSHOT.jar app.jar

RUN chown -R smcas:smcas /app
USER smcas

# Bounded JVM heap to prevent OOM on 4GB VM (B2s)
ENV JAVA_OPTS="-Xms32m -Xmx160m -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
