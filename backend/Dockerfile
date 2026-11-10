# Multi-stage build for Cloud Run (Java 17 / Spring Boot).
# Build context: repository root OR backend/ — see infra docs.
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
RUN useradd --system --uid 10001 --create-home appuser
COPY --from=build /app/target/*.jar /app/app.jar
USER 10001
ENV PORT=8080
EXPOSE 8080
# Cloud Run sets PORT; Spring Boot already reads ${PORT:8080}.
ENTRYPOINT ["java","-XX:+UseContainerSupport","-XX:MaxRAMPercentage=75.0","-jar","/app/app.jar"]
