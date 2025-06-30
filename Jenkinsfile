#!groovy

def backendDir = 'backend'
def frontendDir = 'frontend'

pipeline {

    agent any

    tools {
        nodejs 'nodejs-22'
        maven 'Maven-3.9'
        jdk 'jdk-21'
    }

    options {
        buildDiscarder(logRotator(
            artifactDaysToKeepStr: '14',
            artifactNumToKeepStr: '5',
            daysToKeepStr: '30',
            numToKeepStr: '60'
        ))
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('Build frontend') {
            steps {
                script {
                    dir(frontendDir) {
                        sh 'npm install'
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('Build backend') {
            steps {
                script {
                    def jdkHome = tool name: 'jdk-21', type: 'hudson.model.JDK'
                    withEnv(["JAVA_HOME=${jdkHome}", "PATH=${jdkHome}/bin:${env.PATH}"]) {
                        dir(backendDir) {
                            sh 'echo JAVA_HOME=$JAVA_HOME'
                            sh 'ls -l $JAVA_HOME'
                            sh 'java -version'
                            sh 'mvn -version'
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }
            }
        }

        stage('Build Docker compose') {
            steps {
                configFileProvider([configFile(fileId: '18a658b0-a1ac-44b6-84b9-7f790465c0db', variable: 'ENV_FILE_PATH')]) {
                    script {
                        sh "cp ${ENV_FILE_PATH} .env"
                        sh 'cat .env'
                        sh "docker compose up -d --build --remove-orphans"
                    }
                }
            }
        }

        stage('Run backend tests') {
            steps {
                script {
                    dir(backendDir) {
                        sh 'mvn test'
                    }
                }
            }
        }

        stage('Cleanup') {
            steps {
                script {
                    sh "docker compose down --remove-orphans"
                }
            }
        }

    }
}
