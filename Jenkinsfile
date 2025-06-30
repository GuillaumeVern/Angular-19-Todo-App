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
                        sh 'ng build --configuration=production'
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
                            sh 'mvn clean package -DskipTests'
                            sh 'mv target/*.jar target/app.jar'
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

        stage('Deploy to production') {
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                script {
                    dir(frontendDir) {
                        sh 'rsync -avzr --mkpath --delete -e "ssh -p 4522" dist/abubakkar-apps/browser sshuser@podman.losvernos.local:~/Angular-19-Todo-App/frontend/'
                    }

                    dir(backendDir) {
                        sh 'rsync -avzr --mkpath --delete -e "ssh -p 4522" target/app.jar sshuser@podman.losvernos.local:~/Angular-19-Todo-App/backend/app.jar'
                    }

                    sh 'rsync -avzr --mkpath --delete -e "ssh -p 4522" docker-compose-prod.yml sshuser@podman.losvernos.local:~/Angular-19-Todo-App/docker-compose.yml'
                    sh '''
                        ssh -p 4522 sshuser@losvernos.com << 'EOF'
                            set -e  # exit on error
                            cd ~/Angular-19-Todo-App

                            echo "Bringing down any existing containers..."
                            podman-compose down --remove-orphans || true

                            echo "Bringing up new containers in detached mode..."
                            podman-compose up -d --build --remove-orphans

                            echo "Checking container status..."
                            podman ps
                        EOF
                    '''
                }
            }
        }

    }
}
