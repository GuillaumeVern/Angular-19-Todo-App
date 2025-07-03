#!groovy

def backendDir = 'backend'
def frontendDir = 'frontend'
def nginxDir = 'nginx'

pipeline {
    agent any

    environment {
        CYPRESS_CACHE_FOLDER = "${WORKSPACE}/.cache/Cypress"
    }

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
                        sh 'mvn test -Dspring.profiles.active=test'
                    }
                }
            }
        }

        stage('Run e2e tests') {
            steps {
                script {
                    wrap([$class: 'Xvfb']) {
                        dir(frontendDir) {
                            sh 'npm install'
                            sh 'npx cypress run --browser chromium --config baseUrl=http://localhost:4200'
                        }
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
                        sh 'rsync -avzr --mkpath --delete -e "ssh -p 4522" target/app.jar sshuser@podman.losvernos.local:~/Angular-19-Todo-App/backend/target/'
                    }

                    dir(nginxDir) {
                        sh 'rsync -avzr --mkpath --delete -e "ssh -p 4522" nginx.conf sshuser@podman.losvernos.local:~/Angular-19-Todo-App/nginx/'
                    }

                    sh 'rsync -avzr --mkpath --delete -e "ssh -p 4522" docker-compose-prod.yml sshuser@podman.losvernos.local:~/Angular-19-Todo-App/docker-compose.yml'
                    sh '''
ssh -T -p 4522 sshuser@losvernos.com << 'EOF'
set -e  # exit on error
cd ~/Angular-19-Todo-App

echo "Starting containers as systemd services..."
podman-compose build
systemctl --user daemon-reload
systemctl --user restart container-*.service

echo "Checking container status..."
podman ps
EOF
                    '''
                }
            }
        }

    }
}
