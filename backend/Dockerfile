FROM jelastic/maven:3.9.5-openjdk-21

WORKDIR /app

COPY pom.xml .
COPY src ./src

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "mvn clean package -DskipTests && java -jar target/*.jar"]