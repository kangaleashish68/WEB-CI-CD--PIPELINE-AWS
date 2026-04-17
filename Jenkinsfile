pipeline {
    agent any

    stages {

        stage('Check Files') {
            steps {
                sh 'pwd'
                sh 'ls -l'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t task-app:v1 ./app'
            }
        }

        stage('Run Container') {
            steps {
                sh '''
                docker stop task-container || true
                docker rm task-container || true
                docker run -d -p 3001:3000 --name task-container task-app:v1
                '''
            }
        }
    }
}
