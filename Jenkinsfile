pipeline {
    agent any

    stages {

        stage('Check Files') {
            steps {
                sh 'pwd'
                sh 'ls -l'
            }
        }

        stage('Build Image') {
            steps {
                sh 'sudo /usr/bin/docker build -t task-app:v1 ./app'
            }
        }

        stage('Run Container') {
            steps {
                sh '''
                sudo /usr/bin/docker stop task-container || true
                sudo /usr/bin/docker rm task-container || true
                sudo /usr/bin/docker run -d -p 3001:3000 --name task-container task-app:v1
                '''
            }
        }
    }
}
