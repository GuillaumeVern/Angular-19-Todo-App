#!groovy

pipeline {
    agent any

    tools {
        nodejs 'nodejs-22' // Must match your configured tool name in Jenkins
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
        pollSCM('H/15 * * * *')
        cron('@daily')
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('NPM Install frontend') {
            steps {
                dir('frontend') {
                    withEnv(["NPM_CONFIG_LOGLEVEL=warn"]) {
                        sh 'npm install'
                    }
                }
            }
        }


        stage('Build frontend') {
            steps {
                dir('frontend') {
                    sh 'ng build --configuration=production'
                }
            }
        }
    }
}
