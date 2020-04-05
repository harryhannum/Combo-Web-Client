import os

def main():
    try:
        if os.system('ng --version') != 0:
            raise Exception('Angular is not installed on this computer')

        os.system('ng build')
    except:
        print("Something went wrong, fetching angular's version failed")

    print ("Build finished")

if (__name__ == '__main__'):
    main()